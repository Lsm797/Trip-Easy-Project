package br.com.tripeasy.controller;

import br.com.tripeasy.dto.AtividadeDiaResponse;
import br.com.tripeasy.dto.AtividadeRequest;
import br.com.tripeasy.dto.AtividadeResponse;
import br.com.tripeasy.service.AtividadeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AtividadeController {

    private final AtividadeService service;

    public AtividadeController(AtividadeService service) {
        this.service = service;
    }

    @PostMapping("/viagens/{viagemId}/atividades")
    public ResponseEntity<AtividadeResponse> criar(@PathVariable Long viagemId,
                                                   @Valid @RequestBody AtividadeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(viagemId, request));
    }

    @GetMapping("/viagens/{viagemId}/atividades")
    public List<AtividadeResponse> listar(@PathVariable Long viagemId,
                                          @RequestParam(required = false)
                                          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.listar(viagemId, data);
    }

    @GetMapping("/viagens/{viagemId}/atividades/por-dia")
    public List<AtividadeDiaResponse> listarPorDia(@PathVariable Long viagemId) {
        return service.listarPorDia(viagemId);
    }

    @GetMapping("/atividades/{id}")
    public AtividadeResponse buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/atividades/{id}")
    public AtividadeResponse atualizar(@PathVariable Long id,
                                       @Valid @RequestBody AtividadeRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/atividades/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
