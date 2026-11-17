package br.com.tripeasy.controller;

import br.com.tripeasy.dto.ChecklistConcluidoRequest;
import br.com.tripeasy.dto.ChecklistRequest;
import br.com.tripeasy.dto.ChecklistResponse;
import br.com.tripeasy.service.ChecklistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ChecklistController {

    private final ChecklistService service;

    public ChecklistController(ChecklistService service) {
        this.service = service;
    }

    @PostMapping("/viagens/{viagemId}/checklist")
    public ResponseEntity<ChecklistResponse> criar(@PathVariable Long viagemId,
                                                   @Valid @RequestBody ChecklistRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(viagemId, request));
    }

    @GetMapping("/viagens/{viagemId}/checklist")
    public List<ChecklistResponse> listar(@PathVariable Long viagemId) {
        return service.listar(viagemId);
    }

    @PatchMapping("/checklist/{id}/concluido")
    public ChecklistResponse definirConcluido(@PathVariable Long id,
                                              @Valid @RequestBody ChecklistConcluidoRequest request) {
        return service.definirConcluido(id, request.concluido());
    }

    @DeleteMapping("/checklist/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
