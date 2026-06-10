package com.imobsys.system.dto;

import com.imobsys.system.enums.TipoImovel;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record ImovelUpdateDTO(
        TipoImovel tipo,

        @Positive(message = "A metragem deve ser positiva.")
        Double metragem,

        @PositiveOrZero(message = "O valor mínimo não pode ser negativo.")
        Double valorMinimo,

        @PositiveOrZero(message = "O valor máximo não pode ser negativo.")
        Double valorMaximo,

        @PositiveOrZero(message = "O valor do IPTU não pode ser negativo.")
        Double valorIptu,

        String cidade,
        String estado,
        String cep,
        String endereco,

        @PositiveOrZero(message = "Quantidade de cômodos inválida.")
        Integer qtdComodos,

        @PositiveOrZero(message = "Quantidade de banheiros inválida.")
        Integer qtdBanheiros,

        String particularidades,
        Boolean vistoriaRealizada
) {}
