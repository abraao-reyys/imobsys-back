package com.imobsys.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ClienteUpdateDTO(
        @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
        String nome,

        String rg,

        @Email(message = "E-mail em formato inválido.")
        String email,

        String telefone,

        @PositiveOrZero(message = "A renda não pode ser negativa.")
        Double renda
) {}
