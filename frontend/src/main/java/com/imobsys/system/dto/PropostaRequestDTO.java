package com.imobsys.system.dto;

import com.imobsys.system.enums.FormaPagamento;
import com.imobsys.system.enums.TipoProposta;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.UUID;

public record PropostaRequestDTO(
        @NotNull(message = "O ID do imóvel é obrigatório.")
        UUID imovelId,

        @NotNull(message = "O ID do cliente é obrigatório.")
        UUID clienteId,

        @NotNull(message = "O ID do corretor é obrigatório.")
        UUID corretorId,

        @NotNull(message = "O tipo da proposta é obrigatório (VENDA ou ALUGUEL).")
        TipoProposta tipo,

        @NotNull(message = "O valor da proposta é obrigatório.")
        @Positive(message = "O valor da proposta deve ser positivo.")
        Double valor,

        FormaPagamento formaPagamento,

        @FutureOrPresent(message = "A validade não pode estar no passado.")
        LocalDate validade,

        String termos
) {}
