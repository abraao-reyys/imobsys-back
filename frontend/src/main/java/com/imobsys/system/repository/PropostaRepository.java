package com.imobsys.system.repository;

import com.imobsys.system.model.Proposta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PropostaRepository extends JpaRepository<Proposta, UUID> {
}