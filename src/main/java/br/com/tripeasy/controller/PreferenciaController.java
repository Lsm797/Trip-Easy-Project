
package br.com.tripeasy.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tripeasy.dto.PreferenciaRequestDTO;
import br.com.tripeasy.dto.PreferenciaResponseDTO;
import br.com.tripeasy.model.Preferencia;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.repository.UsuarioRepository;
import br.com.tripeasy.service.PreferenciaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/preferencias")
@CrossOrigin(origins = "*")
public class PreferenciaController {

    private final PreferenciaService preferenciaService;
    private final UsuarioRepository usuarioRepository;

    public PreferenciaController(
            PreferenciaService preferenciaService,
            UsuarioRepository usuarioRepository) {
        this.preferenciaService = preferenciaService;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario usuarioAutenticado() {
        Authentication autenticacao =
                SecurityContextHolder.getContext().getAuthentication();

        String email = autenticacao.getName();

        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário não encontrado!"));
    }

    @PostMapping
    public ResponseEntity<PreferenciaResponseDTO> salvar(
            @RequestBody @Valid PreferenciaRequestDTO dados) {

        Usuario usuario = usuarioAutenticado();

        Preferencia preferencia = new Preferencia();
        preferencia.setEstiloViagem(dados.getEstiloViagem());
        preferencia.setTipoHospedagem(dados.getTipoHospedagem());
        preferencia.setMeioTransporte(dados.getMeioTransporte());
        preferencia.setInteresses(dados.getInteresses());

        Preferencia salva = preferenciaService.salvar(preferencia, usuario);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new PreferenciaResponseDTO(salva));
    }

    @GetMapping
    public ResponseEntity<PreferenciaResponseDTO> buscar() {

        Usuario usuario = usuarioAutenticado();

        Preferencia preferencia =
                preferenciaService.buscarPorUsuario(usuario.getId());

        return ResponseEntity.ok(new PreferenciaResponseDTO(preferencia));
    }
}
