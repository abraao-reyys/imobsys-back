package com.imobsys.system.dto;

import com.imobsys.system.enums.StatusImovel;
import com.imobsys.system.enums.TipoImovel;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ImovelRequestDTO(
        @NotNull(message = "O tipo do imóvel é obrigatório.")
        TipoImovel tipo,

        StatusImovel status,

        @Positive(message = "A matrícula deve ser um número positivo.")
        Integer matricula,

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

        @Size(max = 9, message = "CEP inválido.")
        String cep,

        String endereco,

        @PositiveOrZero(message = "Quantidade de cômodos inválida.")
        Integer qtdComodos,

        @PositiveOrZero(message = "Quantidade de banheiros inválida.")
        Integer qtdBanheiros,

        String particularidades,
        Boolean vistoriaRealizada
) {}
