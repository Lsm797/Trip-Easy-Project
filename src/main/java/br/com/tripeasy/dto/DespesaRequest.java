package br.com.tripeasy.dto;

import br.com.tripeasy.model.CategoriaDespesa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Corpo enviado pelo frontend para criar ou editar uma despesa.
 * data: "2026-11-20" | categoria: ALIMENTACAO, TRANSPORTE, HOSPEDAGEM, PASSEIOS ou OUTROS
 */
public record DespesaRequest(
        @NotBlank(message = "A descrição da despesa é obrigatória.")
        @Size(max = 150, message = "A descrição pode ter no máximo 150 caracteres.")
        String descricao,

        @NotNull(message = "O valor é obrigatório.")
        @Positive(message = "O valor deve ser maior que zero.")
        BigDecimal valor,

        @NotNull(message = "A data é obrigatória.")
        LocalDate data,

        @NotNull(message = "A categoria é obrigatória.")
        CategoriaDespesa categoria) {}
