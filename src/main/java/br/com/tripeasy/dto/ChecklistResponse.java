package br.com.tripeasy.dto;

import br.com.tripeasy.model.ItemChecklist;

public record ChecklistResponse(
        Long id,
        Long viagemId,
        String descricao,
        String categoria,
        boolean concluido
) {
    public static ChecklistResponse de(ItemChecklist item) {
        return new ChecklistResponse(
                item.getId(),
                item.getViagem().getId(),
                item.getDescricao(),
                item.getCategoria(),
                item.isConcluido()
        );
    }
}
