package com.imobsys.system.security;

import com.imobsys.system.model.Corretor;
import com.imobsys.system.repository.CorretorRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CorretorUserDetailsService implements UserDetailsService {

    private final CorretorRepository corretorRepository;

    public CorretorUserDetailsService(CorretorRepository corretorRepository) {
        this.corretorRepository = corretorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Corretor corretor = corretorRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Corretor não encontrado: " + email));

        return new User(
                corretor.getEmail(),
                corretor.getSenha(),
                List.of(new SimpleGrantedAuthority("ROLE_CORRETOR"))
        );
    }
}
