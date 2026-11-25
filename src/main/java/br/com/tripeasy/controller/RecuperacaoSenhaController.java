package br.com.tripeasy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.tripeasy.dto.RecuperarSenhaDTO;
import br.com.tripeasy.dto.RedefinirSenhaDTO;
import br.com.tripeasy.service.RecuperacaoSenhaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class RecuperacaoSenhaController {

    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public RecuperacaoSenhaController(RecuperacaoSenhaService recuperacaoSenhaService) {
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<String> recuperarSenha(
            @Valid @RequestBody RecuperarSenhaDTO dados) {

        recuperacaoSenhaService.solicitarCodigo(dados.getEmail().trim());

        return ResponseEntity.ok("Código de recuperação gerado.");
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<String> redefinirSenha(
            @Valid @RequestBody RedefinirSenhaDTO dados) {

        recuperacaoSenhaService.redefinirSenha(
                dados.getEmail().trim(),
                dados.getCodigo(),
                dados.getNovaSenha());

        return ResponseEntity.ok("Senha redefinida com sucesso!");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> tratarErro(IllegalArgumentException erro) {
        return ResponseEntity.badRequest().body(erro.getMessage());
    }
}
