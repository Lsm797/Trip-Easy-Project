package br.com.tripeasy.dto;

import jakarta.validation.constraints.NotNull;

/** Corpo para marcar (true) ou desmarcar (false) um item. */
public record ChecklistConcluidoRequest(
        @NotNull(message = "Informe se o item está concluído (true ou false).")
        Boolean concluido
) {
}
