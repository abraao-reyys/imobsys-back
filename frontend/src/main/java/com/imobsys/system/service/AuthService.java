package com.imobsys.system.service;

import com.imobsys.system.dto.LoginRequestDTO;
import com.imobsys.system.dto.LoginResponseDTO;
import com.imobsys.system.exception.ResourceNotFoundException;
import com.imobsys.system.model.Corretor;
import com.imobsys.system.repository.CorretorRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CorretorRepository corretorRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       CorretorRepository corretorRepository) {
        this.authenticationManager = authenticationManager;
        this.corretorRepository = corretorRepository;
    }

    public LoginResponseDTO autenticar(LoginRequestDTO dto) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.senha())
        );

        Corretor corretor = corretorRepository.findByEmail(auth.getName())
                .orElseThrow(() -> ResourceNotFoundException.of("Corretor", dto.email()));

        return new LoginResponseDTO(
                corretor.getId(),
                corretor.getNome(),
                corretor.getEmail(),
                "Autenticação realizada com sucesso. Utilize HTTP Basic Auth (e-mail/senha) nas próximas requisições."
        );
    }
}
