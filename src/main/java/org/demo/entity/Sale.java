package org.demo.entity;

import java.time.LocalDateTime;
import lombok.EqualsAndHashCode;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.SaleStatus;
import org.cxbox.model.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "SALE")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Sale extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "CLIENT_ID")
	private Client client;

	@Column
	private Product product;

	@Column
	@Enumerated(EnumType.STRING)
	private SaleStatus status;


	private Long sum;


	@Column
	private LocalDateTime dateCreatedSales;

}
