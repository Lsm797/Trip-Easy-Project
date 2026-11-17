package br.com.tripeasy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corpo para cadastrar um item do checklist. */
public record ChecklistRequest(
        @NotBlank(message = "A descrição do item é obrigatória.")
        @Size(max = 150, message = "A descrição pode ter no máximo 150 caracteres.")
        String descricao,

        @Size(max = 60, message = "A categoria pode ter no máximo 60 caracteres.")
        String categoria
) {
}
