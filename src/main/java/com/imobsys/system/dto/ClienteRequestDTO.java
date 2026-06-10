package com.imobsys.system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ClienteRequestDTO(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres.")
        String nome,

        String rg,

        @NotBlank(message = "O CPF é obrigatório.")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos numéricos (sem pontuação).")
        String cpf,

        @Email(message = "E-mail em formato inválido.")
        String email,

        String telefone,

        @PositiveOrZero(message = "A renda não pode ser negativa.")
        Double renda
) {}
