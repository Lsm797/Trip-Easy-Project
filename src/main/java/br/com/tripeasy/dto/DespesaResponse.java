package br.com.tripeasy.dto;

import br.com.tripeasy.model.CategoriaDespesa;
import br.com.tripeasy.model.Despesa;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DespesaResponse(
        Long id,
        Long viagemId,
        String descricao,
        BigDecimal valor,
        LocalDate data,
        CategoriaDespesa categoria) {

    public static DespesaResponse de(Despesa d) {
        return new DespesaResponse(
                d.getId(),
                d.getViagem().getId(),
                d.getDescricao(),
                d.getValor(),
                d.getData(),
                d.getCategoria()
        );
    }
}
