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

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Atividade do roteiro de uma viagem.
 * Mapeada na tabela "roteiros" do diagrama de banco do grupo.
 */
@Entity
@Table(name = "roteiros")
public class Atividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_roteiro")
    private Long id;

    // ON DELETE CASCADE no banco: ao excluir a viagem, as atividades dela somem junto
    // (composição do diagrama de classes), sem precisar mexer no ViagemService.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_viagem", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Viagem viagem;

    @Column(name = "data_atividade", nullable = false)
    private LocalDate data;

    @Column(name = "horario")
    private LocalTime horario;

    // Coluna "atividade" no banco; no código chamo de titulo para não ficar Atividade.atividade
    @Column(name = "atividade", nullable = false, length = 150)
    private String titulo;

    @Column(name = "local", length = 150)
    private String local;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    public Atividade() {
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

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getLocal() {
        return local;
    }

    public void setLocal(String local) {
        this.local = local;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
