package br.com.tripeasy.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.tripeasy.model.RecuperacaoSenha;

public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, Long> {

    Optional<RecuperacaoSenha> findFirstByEmailAndUsadoFalseOrderByIdDesc(String email);

    List<RecuperacaoSenha> findByEmailAndUsadoFalse(String email);
}
