package br.com.tripeasy.service;

import br.com.tripeasy.dto.AtividadeDiaResponse;
import br.com.tripeasy.dto.AtividadeRequest;
import br.com.tripeasy.dto.AtividadeResponse;
import br.com.tripeasy.exception.RecursoNaoEncontradoException;
import br.com.tripeasy.model.Atividade;
import br.com.tripeasy.repository.AtividadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AtividadeService {

    // Ordena por data e depois por horário; atividades sem horário ficam no fim do dia
    private static final Comparator<Atividade> ORDEM_CRONOLOGICA =
            Comparator.comparing(Atividade::getData)
                    .thenComparing(Atividade::getHorario,
                            Comparator.nullsLast(Comparator.<LocalTime>naturalOrder()))
                    .thenComparing(Atividade::getId);

    private final AtividadeRepository repository;
    private final ViagemAcessoService acesso;

    public AtividadeService(AtividadeRepository repository, ViagemAcessoService acesso) {
        this.repository = repository;
        this.acesso = acesso;
    }

    @Transactional
    public AtividadeResponse criar(Long viagemId, AtividadeRequest request) {
        Atividade atividade = new Atividade();
        atividade.setViagem(acesso.buscarViagemDoUsuarioLogado(viagemId));
        preencher(atividade, request);
        return AtividadeResponse.de(repository.save(atividade));
    }

    /** Lista as atividades da viagem em ordem cronológica; se "data" vier preenchida, filtra o dia. */
    @Transactional(readOnly = true)
    public List<AtividadeResponse> listar(Long viagemId, LocalDate data) {
        acesso.buscarViagemDoUsuarioLogado(viagemId);
        List<Atividade> atividades = (data == null)
                ? repository.findByViagem_Id(viagemId)
                : repository.findByViagem_IdAndData(viagemId, data);
        return atividades.stream()
                .sorted(ORDEM_CRONOLOGICA)
                .map(AtividadeResponse::de)
                .toList();
    }

    /** Agrupa as atividades da viagem por dia, em ordem cronológica. */
    @Transactional(readOnly = true)
    public List<AtividadeDiaResponse> listarPorDia(Long viagemId) {
        acesso.buscarViagemDoUsuarioLogado(viagemId);
        return repository.findByViagem_Id(viagemId).stream()
                .sorted(ORDEM_CRONOLOGICA)
                .collect(Collectors.groupingBy(
                        Atividade::getData,
                        LinkedHashMap::new,
                        Collectors.mapping(AtividadeResponse::de, Collectors.toList())))
                .entrySet().stream()
                .map(e -> new AtividadeDiaResponse(e.getKey(), e.getValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AtividadeResponse buscar(Long id) {
        return AtividadeResponse.de(buscarEntidade(id));
    }

    @Transactional
    public AtividadeResponse atualizar(Long id, AtividadeRequest request) {
        Atividade atividade = buscarEntidade(id);
        preencher(atividade, request);
        return AtividadeResponse.de(repository.save(atividade));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    // Só encontra a atividade se a viagem dela pertencer ao usuário logado
    private Atividade buscarEntidade(Long id) {
        return repository.findByIdAndViagem_Usuario_Id(id, acesso.idDoUsuarioLogado())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Atividade não encontrada!"));
    }

    private void preencher(Atividade atividade, AtividadeRequest request) {
        atividade.setData(request.data());
        atividade.setHorario(request.horario());
        atividade.setTitulo(request.titulo().trim());
        atividade.setLocal(vazioParaNulo(request.local()));
        atividade.setObservacao(vazioParaNulo(request.observacao()));
    }

    private String vazioParaNulo(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}
