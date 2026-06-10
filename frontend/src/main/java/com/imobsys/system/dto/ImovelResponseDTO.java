package com.imobsys.system.dto;

import com.imobsys.system.enums.StatusImovel;
import com.imobsys.system.enums.TipoImovel;

import java.util.UUID;

public record ImovelResponseDTO(
        UUID id,
        TipoImovel tipo,
        StatusImovel status,
        Integer matricula,
        Double metragem,
        Double valorMinimo,
        Double valorMaximo,
        Double valorIptu,
        String cidade,
        String estado,
        String cep,
        String endereco,
        Integer qtdComodos,
        Integer qtdBanheiros,
        String particularidades,
        Boolean vistoriaRealizada
) {}
