package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;

@Entity
@Table(name = "GENERATION_DOCUMENTS")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class GenerationDocuments extends BaseEntity {

	private String notes;

	@Column
	private String file;

	@Column
	private String fileId;

	@Column
	private String fieldKeyForContentType;

	@Column
	private byte[] fieldKeyForBase64;

	@ManyToOne
	@JoinColumn(name = "GENERATION_ID")
	private Generation generation;

}
