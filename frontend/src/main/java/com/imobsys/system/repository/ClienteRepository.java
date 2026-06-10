package com.imobsys.system.repository;

import com.imobsys.system.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
}
