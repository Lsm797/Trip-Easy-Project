package br.com.tripeasy.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.tripeasy.model.RecuperacaoSenha;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.repository.RecuperacaoSenhaRepository;
import br.com.tripeasy.repository.UsuarioRepository;

@Service
public class RecuperacaoSenhaService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacaoSenhaService.class);

    private static final int MINUTOS_VALIDADE = 15;
    private static final int MAX_TENTATIVAS = 5;
    private static final String MSG_CODIGO_INVALIDO = "Código inválido ou expirado.";

    private final UsuarioRepository usuarioRepository;
    private final RecuperacaoSenhaRepository recuperacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public RecuperacaoSenhaService(
            UsuarioRepository usuarioRepository,
            RecuperacaoSenhaRepository recuperacaoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.recuperacaoRepository = recuperacaoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Gera um código de 6 dígitos. Se o e-mail não tiver conta, avisa o usuário.
     * (Em um sistema público, o ideal seria responder igual nos dois casos, para
     * não revelar quais e-mails têm conta.)
     *
     * MODO DEMONSTRAÇÃO: o código é mostrado no console do backend.
     * Para produção, troque o log por um envio de e-mail (JavaMailSender).
     */
    @Transactional
    public void solicitarCodigo(String email) {

        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isEmpty()) {
            throw new IllegalArgumentException("Não existe conta cadastrada com este e-mail.");
        }

        // invalida códigos anteriores ainda não usados
        for (RecuperacaoSenha anterior : recuperacaoRepository.findByEmailAndUsadoFalse(email)) {
            anterior.setUsado(true);
        }

        String codigo = String.format("%06d", random.nextInt(1_000_000));

        RecuperacaoSenha recuperacao = new RecuperacaoSenha();
        recuperacao.setEmail(email);
        recuperacao.setCodigoHash(passwordEncoder.encode(codigo));
        recuperacao.setExpiraEm(LocalDateTime.now().plusMinutes(MINUTOS_VALIDADE));
        recuperacao.setTentativas(0);
        recuperacao.setUsado(false);
        recuperacaoRepository.save(recuperacao);

        log.info("==================================================");
        log.info(" RECUPERAÇÃO DE SENHA (modo demonstração)");
        log.info(" E-mail: {}", email);
        log.info(" Código: {}  (válido por {} minutos)", codigo, MINUTOS_VALIDADE);
        log.info("==================================================");
    }

    /**
     * noRollbackFor: o aumento do contador de tentativas precisa ser gravado
     * mesmo quando o código está errado e a exceção é lançada.
     */
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void redefinirSenha(String email, String codigo, String novaSenha) {

        RecuperacaoSenha recuperacao = recuperacaoRepository
                .findFirstByEmailAndUsadoFalseOrderByIdDesc(email)
                .orElseThrow(() -> new IllegalArgumentException(MSG_CODIGO_INVALIDO));

        if (recuperacao.getExpiraEm().isBefore(LocalDateTime.now())) {
            recuperacao.setUsado(true);
            throw new IllegalArgumentException(MSG_CODIGO_INVALIDO);
        }

        if (recuperacao.getTentativas() >= MAX_TENTATIVAS) {
            recuperacao.setUsado(true);
            throw new IllegalArgumentException("Muitas tentativas. Gere um novo código.");
        }

        if (!passwordEncoder.matches(codigo, recuperacao.getCodigoHash())) {
            recuperacao.setTentativas(recuperacao.getTentativas() + 1);
            if (recuperacao.getTentativas() >= MAX_TENTATIVAS) {
                recuperacao.setUsado(true);
            }
            throw new IllegalArgumentException(MSG_CODIGO_INVALIDO);
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(MSG_CODIGO_INVALIDO));

        if (passwordEncoder.matches(novaSenha, usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        recuperacao.setUsado(true);
    }
}
