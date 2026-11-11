
package br.com.tripeasy.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ViagemRequestDTO {

    @NotBlank(message = "O nome da viagem é obrigatório.")
    @Size(max = 100, message = "O nome da viagem deve ter no máximo 100 caracteres.")
    private String nome;

    @NotBlank(message = "O destino é obrigatório.")
    @Size(max = 150, message = "O destino deve ter no máximo 150 caracteres.")
    private String destino;

    @NotNull(message = "A data de ida é obrigatória.")
    @FutureOrPresent(message = "A data de ida não pode estar no passado.")
    private LocalDate dataIda;

    @NotNull(message = "A data de volta é obrigatória.")
    @FutureOrPresent(message = "A data de volta não pode estar no passado.")
    private LocalDate dataVolta;

    @NotNull(message = "O orçamento é obrigatório.")
    @PositiveOrZero(message = "O orçamento não pode ser negativo.")
    private BigDecimal orcamento;

    @AssertTrue(message = "A data de volta não pode ser anterior à data de ida.")
    public boolean isPeriodoValido() {
        if (dataIda == null || dataVolta == null) {
            return true;
        }

        return !dataVolta.isBefore(dataIda);
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public LocalDate getDataIda() {
        return dataIda;
    }

    public void setDataIda(LocalDate dataIda) {
        this.dataIda = dataIda;
    }

    public LocalDate getDataVolta() {
        return dataVolta;
    }

    public void setDataVolta(LocalDate dataVolta) {
        this.dataVolta = dataVolta;
    }

    public BigDecimal getOrcamento() {
        return orcamento;
    }

    public void setOrcamento(BigDecimal orcamento) {
        this.orcamento = orcamento;
    }
}
