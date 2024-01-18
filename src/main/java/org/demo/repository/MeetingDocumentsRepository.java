package org.demo.repository;

import org.demo.entity.Meeting;
import org.demo.entity.MeetingDocuments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingDocumentsRepository extends JpaRepository<MeetingDocuments, Long>, JpaSpecificationExecutor<MeetingDocuments> {

}
