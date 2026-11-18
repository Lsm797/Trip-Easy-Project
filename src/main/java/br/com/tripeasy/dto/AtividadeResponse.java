package br.com.tripeasy.dto;

import br.com.tripeasy.model.Atividade;

import java.time.LocalDate;
import java.time.LocalTime;

public record AtividadeResponse(
        Long id,
        Long viagemId,
        LocalDate data,
        LocalTime horario,
        String titulo,
        String local,
        String observacao
) {
    public static AtividadeResponse de(Atividade a) {
        return new AtividadeResponse(
                a.getId(),
                a.getViagem().getId(),
                a.getData(),
                a.getHorario(),
                a.getTitulo(),
                a.getLocal(),
                a.getObservacao()
        );
    }
}
