package org.demo.repository;

import org.demo.entity.GenerationDocuments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenerationDocumentsRepository extends JpaRepository<GenerationDocuments, Long> {

}