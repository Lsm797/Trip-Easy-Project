package br.com.tripeasy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Corpo enviado pelo frontend para criar ou editar uma atividade.
 * data: "2026-11-20" | horario: "08:30" (opcional)
 */
public record AtividadeRequest(
        @NotNull(message = "A data da atividade é obrigatória.")
        LocalDate data,

        LocalTime horario,

        @NotBlank(message = "O título da atividade é obrigatório.")
        @Size(max = 150, message = "O título pode ter no máximo 150 caracteres.")
        String titulo,

        @Size(max = 150, message = "O local pode ter no máximo 150 caracteres.")
        String local,

        String observacao
) {
}
