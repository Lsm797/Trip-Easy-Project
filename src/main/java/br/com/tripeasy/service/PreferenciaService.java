package br.com.tripeasy.service;

import org.springframework.stereotype.Service;

import br.com.tripeasy.model.Preferencia;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.repository.PreferenciaRepository;

@Service
public class PreferenciaService {

    private final PreferenciaRepository preferenciaRepository;

    public PreferenciaService(PreferenciaRepository preferenciaRepository) {
        this.preferenciaRepository = preferenciaRepository;
    }

    public Preferencia buscarPorUsuario(Long usuarioId) {
        return preferenciaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Preferências não encontradas para este usuário."));
    }

    public Preferencia salvar(Preferencia dados, Usuario usuario) {

        Preferencia preferencia = preferenciaRepository
                .findByUsuarioId(usuario.getId())
                .orElse(new Preferencia());

        preferencia.setEstiloViagem(dados.getEstiloViagem());
        preferencia.setTipoHospedagem(dados.getTipoHospedagem());
        preferencia.setMeioTransporte(dados.getMeioTransporte());
        preferencia.setInteresses(dados.getInteresses());
        preferencia.setUsuario(usuario);

        return preferenciaRepository.save(preferencia);
    }
}