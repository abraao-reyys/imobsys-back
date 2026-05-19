package com.imobsys.system.dto;

import com.imobsys.system.enums.FormaPagamento;
import com.imobsys.system.enums.TipoProposta;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record PropostaUpdateDTO(
        TipoProposta tipo,

        @Positive(message = "O valor da proposta deve ser positivo.")
        Double valor,

        FormaPagamento formaPagamento,

        @FutureOrPresent(message = "A validade não pode estar no passado.")
        LocalDate validade,

        String termos
) {}
