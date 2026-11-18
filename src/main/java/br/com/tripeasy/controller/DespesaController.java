package br.com.tripeasy.controller;

import br.com.tripeasy.dto.DespesaRequest;
import br.com.tripeasy.dto.DespesaResponse;
import br.com.tripeasy.dto.ResumoDespesasResponse;
import br.com.tripeasy.service.DespesaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DespesaController {

    private final DespesaService service;

    public DespesaController(DespesaService service) {
        this.service = service;
    }

    @PostMapping("/viagens/{viagemId}/despesas")
    public ResponseEntity<DespesaResponse> criar(@PathVariable Long viagemId,
                                                 @Valid @RequestBody DespesaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(viagemId, request));
    }

    @GetMapping("/viagens/{viagemId}/despesas")
    public List<DespesaResponse> listar(@PathVariable Long viagemId) {
        return service.listar(viagemId);
    }

    @GetMapping("/viagens/{viagemId}/despesas/resumo")
    public ResumoDespesasResponse resumo(@PathVariable Long viagemId) {
        return service.resumo(viagemId);
    }

    @GetMapping("/despesas/{id}")
    public DespesaResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/despesas/{id}")
    public DespesaResponse atualizar(@PathVariable Long id,
                                     @Valid @RequestBody DespesaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/despesas/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
