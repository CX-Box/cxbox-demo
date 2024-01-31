package org.demo.repository;

import org.cxbox.model.core.entity.User;
import org.demo.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long>, JpaSpecificationExecutor<AppUser> {
}

