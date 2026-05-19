package com.imobsys.system.model;

import com.imobsys.system.enums.StatusImovel;
import com.imobsys.system.enums.TipoImovel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "tb_imoveis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Imovel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoImovel tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusImovel status;

    @Column(unique = true)
    private Integer matricula;

    private Double metragem;
    private Double valorMinimo;
    private Double valorMaximo;
    private Double valorIptu;
    private String cidade;
    private String estado;
    private String cep;
    private String endereco;
    private Integer qtdComodos;
    private Integer qtdBanheiros;

    @Column(columnDefinition = "TEXT")
    private String particularidades;

    private Boolean vistoriaRealizada;

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = StatusImovel.DISPONIVEL;
        }
    }
}
