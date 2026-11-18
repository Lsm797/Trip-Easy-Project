package br.com.tripeasy.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Item do checklist de uma viagem.
 * Mapeado na tabela "checklist_itens" do diagrama de banco do grupo.
 */
@Entity
@Table(name = "checklist_itens")
public class ItemChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Long id;

    // ON DELETE CASCADE no banco (ver comentário em Atividade)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_viagem", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Viagem viagem;

    @Column(name = "descricao", nullable = false, length = 150)
    private String descricao;

    @Column(name = "categoria", length = 60)
    private String categoria;

    @Column(name = "concluido", nullable = false)
    private boolean concluido = false;

    public ItemChecklist() {
    }

    public Long getId() {
        return id;
    }

    public Viagem getViagem() {
        return viagem;
    }

    public void setViagem(Viagem viagem) {
        this.viagem = viagem;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public boolean isConcluido() {
        return concluido;
    }

    public void setConcluido(boolean concluido) {
        this.concluido = concluido;
    }
}
