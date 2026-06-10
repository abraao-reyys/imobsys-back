package com.imobsys.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitacaoAjusteDTO(
        @NotBlank(message = "É necessário descrever o ajuste solicitado.")
        @Size(min = 10, max = 2000, message = "A observação deve ter entre 10 e 2000 caracteres.")
        String observacao
) {}
