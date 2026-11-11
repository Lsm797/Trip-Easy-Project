package br.com.tripeasy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.repository.UsuarioRepository;
import br.com.tripeasy.service.ViagemService;
import br.com.tripeasy.model.Viagem;
import java.util.List;
import jakarta.validation.Valid;
import br.com.tripeasy.dto.ViagemRequestDTO;

import br.com.tripeasy.dto.ViagemResponseDTO;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/viagens")
@CrossOrigin(origins = "*")
public class ViagemController {

    private final ViagemService viagemService;
    private final UsuarioRepository usuarioRepository;

    public ViagemController(
        ViagemService viagemService,
        UsuarioRepository usuarioRepository) {

        this.viagemService = viagemService;
        this.usuarioRepository = usuarioRepository;
    }

    private Usuario usuarioAutenticado() {

        Authentication autenticacao =
                SecurityContextHolder.getContext().getAuthentication();

        String email = autenticacao.getName();

        return usuarioRepository.findByEmail(email)
            .orElseThrow(() ->
                        new IllegalArgumentException("Usuário não encontrado!")
            );
    }

    @PostMapping
    public ResponseEntity<ViagemResponseDTO> cadastrar(
            @Valid @RequestBody ViagemRequestDTO dados) {

        Usuario usuario = usuarioAutenticado();

        Viagem viagem = converterParaEntidade(dados);

        Viagem novaViagem = viagemService.cadastrar(viagem, usuario);

        return ResponseEntity.status(201)
            .body(new ViagemResponseDTO(novaViagem));
    }

    @GetMapping
    public ResponseEntity<List<ViagemResponseDTO>> listar() {
        Usuario usuario = usuarioAutenticado();

    List<ViagemResponseDTO> viagens = viagemService
            .listarPorUsuario(usuario.getId())
            .stream()
            .map(ViagemResponseDTO::new)
            .collect(Collectors.toList());

    return ResponseEntity.ok(viagens);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioAutenticado();

        Viagem viagem = viagemService.buscarPorIdEUsuario(id, usuario.getId());

        return ResponseEntity.ok(new ViagemResponseDTO(viagem));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ViagemResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ViagemRequestDTO dadosAtualizados) {

        Usuario usuario = usuarioAutenticado();

        Viagem viagem = converterParaEntidade(dadosAtualizados);

        Viagem viagemAtualizada = viagemService.atualizar(
                id, viagem, usuario.getId());

        return ResponseEntity.ok(new ViagemResponseDTO(viagemAtualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {

        Usuario usuario = usuarioAutenticado();

        viagemService.excluir(id, usuario.getId());

        return ResponseEntity.noContent().build();
    }

    private Viagem converterParaEntidade(ViagemRequestDTO dados) {

        Viagem viagem = new Viagem();

        viagem.setNome(dados.getNome());
        viagem.setDestino(dados.getDestino());
        viagem.setDataIda(dados.getDataIda());
        viagem.setDataVolta(dados.getDataVolta());
        viagem.setOrcamento(dados.getOrcamento());

        return viagem;
    }
}
