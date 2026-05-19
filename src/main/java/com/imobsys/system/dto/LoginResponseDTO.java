package com.imobsys.system.dto;

import java.util.UUID;

public record LoginResponseDTO(
        UUID corretorId,
        String nome,
        String email,
        String mensagem
) {}
