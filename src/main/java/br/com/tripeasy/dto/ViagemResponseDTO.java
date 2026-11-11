
package br.com.tripeasy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import br.com.tripeasy.model.Viagem;

public class ViagemResponseDTO {

    private Long id;
    private String nome;
    private String destino;
    private LocalDate dataIda;
    private LocalDate dataVolta;
    private BigDecimal orcamento;

    public ViagemResponseDTO(Viagem viagem) {
        this.id = viagem.getId();
        this.nome = viagem.getNome();
        this.destino = viagem.getDestino();
        this.dataIda = viagem.getDataIda();
        this.dataVolta = viagem.getDataVolta();
        this.orcamento = viagem.getOrcamento();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDestino() {
        return destino;
    }

    public LocalDate getDataIda() {
        return dataIda;
    }

    public LocalDate getDataVolta() {
        return dataVolta;
    }

    public BigDecimal getOrcamento() {
        return orcamento;
    }
}
