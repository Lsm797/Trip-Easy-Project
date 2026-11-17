package br.com.tripeasy.service;

import br.com.tripeasy.dto.ChecklistRequest;
import br.com.tripeasy.dto.ChecklistResponse;
import br.com.tripeasy.exception.RecursoNaoEncontradoException;
import br.com.tripeasy.model.ItemChecklist;
import br.com.tripeasy.repository.ItemChecklistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChecklistService {

    private final ItemChecklistRepository repository;
    private final ViagemAcessoService acesso;

    public ChecklistService(ItemChecklistRepository repository, ViagemAcessoService acesso) {
        this.repository = repository;
        this.acesso = acesso;
    }

    @Transactional
    public ChecklistResponse criar(Long viagemId, ChecklistRequest request) {
        ItemChecklist item = new ItemChecklist();
        item.setViagem(acesso.buscarViagemDoUsuarioLogado(viagemId));
        item.setDescricao(request.descricao().trim());
        item.setCategoria(vazioParaNulo(request.categoria()));
        item.setConcluido(false);
        return ChecklistResponse.de(repository.save(item));
    }

    @Transactional(readOnly = true)
    public List<ChecklistResponse> listar(Long viagemId) {
        acesso.buscarViagemDoUsuarioLogado(viagemId);
        return repository.findByViagem_IdOrderByIdAsc(viagemId).stream()
                .map(ChecklistResponse::de)
                .toList();
    }

    /** Marca (true) ou desmarca (false) um item como concluído. */
    @Transactional
    public ChecklistResponse definirConcluido(Long id, boolean concluido) {
        ItemChecklist item = buscarEntidade(id);
        item.setConcluido(concluido);
        return ChecklistResponse.de(repository.save(item));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    // Só encontra o item se a viagem dele pertencer ao usuário logado
    private ItemChecklist buscarEntidade(Long id) {
        return repository.findByIdAndViagem_Usuario_Id(id, acesso.idDoUsuarioLogado())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Item do checklist não encontrado!"));
    }

    private String vazioParaNulo(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}
