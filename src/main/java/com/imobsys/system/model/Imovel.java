package com.imobsys.system.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
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

    private String tipo;

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
}