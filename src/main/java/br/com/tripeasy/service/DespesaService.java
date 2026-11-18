package br.com.tripeasy.service;

import br.com.tripeasy.dto.DespesaRequest;
import br.com.tripeasy.dto.DespesaResponse;
import br.com.tripeasy.dto.ResumoDespesasResponse;
import br.com.tripeasy.exception.RecursoNaoEncontradoException;
import br.com.tripeasy.model.CategoriaDespesa;
import br.com.tripeasy.model.Despesa;
import br.com.tripeasy.model.Viagem;
import br.com.tripeasy.repository.DespesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class DespesaService {

    private final DespesaRepository repository;
    private final ViagemAcessoService acesso;

    public DespesaService(DespesaRepository repository, ViagemAcessoService acesso) {
        this.repository = repository;
        this.acesso = acesso;
    }

    @Transactional
    public DespesaResponse criar(Long viagemId, DespesaRequest request) {
        Despesa despesa = new Despesa();
        despesa.setViagem(acesso.buscarViagemDoUsuarioLogado(viagemId));
        preencher(despesa, request);
        return DespesaResponse.de(repository.save(despesa));
    }

    @Transactional(readOnly = true)
    public List<DespesaResponse> listar(Long viagemId) {
        acesso.buscarViagemDoUsuarioLogado(viagemId);
        return repository.findByViagem_IdOrderByDataDescIdDesc(viagemId).stream()
                .map(DespesaResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public DespesaResponse buscar(Long id) {
        return DespesaResponse.de(buscarEntidade(id));
    }

    @Transactional
    public DespesaResponse atualizar(Long id, DespesaRequest request) {
        Despesa despesa = buscarEntidade(id);
        preencher(despesa, request);
        return DespesaResponse.de(repository.save(despesa));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    /** Dashboard: total gasto, saldo restante, alerta de orçamento e total por categoria. */
    @Transactional(readOnly = true)
    public ResumoDespesasResponse resumo(Long viagemId) {
        Viagem viagem = acesso.buscarViagemDoUsuarioLogado(viagemId);

        // CONFERIR: getOrcamento() precisa existir em Viagem e ser BigDecimal
        BigDecimal orcamento = viagem.getOrcamento() != null ? viagem.getOrcamento() : BigDecimal.ZERO;
        BigDecimal totalGasto = repository.somaTotalPorViagem(viagemId);
        BigDecimal saldoRestante = orcamento.subtract(totalGasto);
        boolean ultrapassado = totalGasto.compareTo(orcamento) > 0;

        // Todas as categorias aparecem, mesmo com valor 0
        Map<CategoriaDespesa, BigDecimal> porCategoria = new EnumMap<>(CategoriaDespesa.class);
        for (CategoriaDespesa c : CategoriaDespesa.values()) {
            porCategoria.put(c, BigDecimal.ZERO);
        }
        for (Object[] linha : repository.somaPorCategoria(viagemId)) {
            porCategoria.put((CategoriaDespesa) linha[0], (BigDecimal) linha[1]);
        }

        return new ResumoDespesasResponse(orcamento, totalGasto, saldoRestante, ultrapassado, porCategoria);
    }

    // Só encontra a despesa se a viagem dela pertencer ao usuário logado
    private Despesa buscarEntidade(Long id) {
        return repository.findByIdAndViagem_Usuario_Id(id, acesso.idDoUsuarioLogado())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Despesa não encontrada!"));
    }

    private void preencher(Despesa despesa, DespesaRequest request) {
        despesa.setDescricao(request.descricao().trim());
        despesa.setValor(request.valor());
        despesa.setData(request.data());
        despesa.setCategoria(request.categoria());
    }
}
