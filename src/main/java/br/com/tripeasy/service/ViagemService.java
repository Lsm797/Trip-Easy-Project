package br.com.tripeasy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import br.com.tripeasy.model.Viagem;
import br.com.tripeasy.repository.ViagemRepository;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.exception.RecursoNaoEncontradoException;

@Service
public class ViagemService {

    private final ViagemRepository viagemRepository;

    public ViagemService(ViagemRepository viagemRepository) {
        this.viagemRepository = viagemRepository;
    }
    public Viagem cadastrar(Viagem viagem, Usuario usuario) {

        viagem.setUsuario(usuario);

        return viagemRepository.save(viagem);
    }
    public List<Viagem> listarPorUsuario(Long usuarioId) {
        return viagemRepository.findAllByUsuario_Id(usuarioId);
    }
    public Viagem buscarPorIdEUsuario(Long id, Long usuarioId) {
        return viagemRepository.findByIdAndUsuario_Id(id, usuarioId)
                .orElseThrow(() ->
                    new RecursoNaoEncontradoException("Viagem não encontrada!")
            );
    }

    public Viagem atualizar(Long id, Viagem dadosAtualizados, Long usuarioId) {

        Viagem viagem = buscarPorIdEUsuario(id, usuarioId);

        viagem.setNome(dadosAtualizados.getNome());
        viagem.setDestino(dadosAtualizados.getDestino());
        viagem.setDataIda(dadosAtualizados.getDataIda());
        viagem.setDataVolta(dadosAtualizados.getDataVolta());
        viagem.setOrcamento(dadosAtualizados.getOrcamento());

        return viagemRepository.save(viagem);
    }

    public void excluir(Long id, Long usuarioId) {

        Viagem viagem = buscarPorIdEUsuario(id, usuarioId);

        viagemRepository.delete(viagem);
    }
}