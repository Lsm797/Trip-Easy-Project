package br.com.tripeasy.dto;

/**
 * Grupo de validação usado só no cadastro de viagens.
 * Regras marcadas com este grupo (como "data no passado") valem ao criar uma viagem,
 * mas não ao editar uma viagem que já começou.
 */
public interface ValidacaoCadastro {
}
