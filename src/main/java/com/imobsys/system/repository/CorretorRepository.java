package com.imobsys.system.repository;

import com.imobsys.system.model.Corretor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CorretorRepository extends JpaRepository<Corretor, UUID> {
}