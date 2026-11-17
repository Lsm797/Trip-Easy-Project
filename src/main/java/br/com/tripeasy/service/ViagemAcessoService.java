package br.com.tripeasy.service;

import br.com.tripeasy.exception.RecursoNaoEncontradoException;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.model.Viagem;
import br.com.tripeasy.repository.UsuarioRepository;
import br.com.tripeasy.repository.ViagemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Descobre o usuário logado e garante que a viagem pedida é dele.
 * Segue o mesmo padrão do ViagemController (e-mail da sessão → Usuario)
 * e a mesma regra do ViagemService (viagem de outro usuário = "não encontrada").
 */
@Service
public class ViagemAcessoService {

    private final UsuarioRepository usuarioRepository;
    private final ViagemRepository viagemRepository;

    public ViagemAcessoService(UsuarioRepository usuarioRepository,
                               ViagemRepository viagemRepository) {
        this.usuarioRepository = usuarioRepository;
        this.viagemRepository = viagemRepository;
    }

    public Long idDoUsuarioLogado() {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado!");
        }
        return usuarioRepository.findByEmail(autenticacao.getName())
                .map(Usuario::getId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado!"));
    }

    public Viagem buscarViagemDoUsuarioLogado(Long viagemId) {
        return viagemRepository.findByIdAndUsuario_Id(viagemId, idDoUsuarioLogado())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Viagem não encontrada!"));
    }
}
