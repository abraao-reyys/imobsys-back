package com.imobsys.system.dto;

import com.imobsys.system.enums.StatusImovel;
import jakarta.validation.constraints.NotNull;

public record ImovelStatusUpdateDTO(
        @NotNull(message = "O novo status do imóvel é obrigatório.")
        StatusImovel status
) {}
