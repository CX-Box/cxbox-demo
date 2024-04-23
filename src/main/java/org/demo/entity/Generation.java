package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.enums.DetalizationEnum;
import org.demo.entity.enums.StyleEnum;

@Entity
@Table(name = "Generation")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Generation extends BaseEntity {

	private String name;

	@Enumerated(value = jakarta.persistence.EnumType.STRING)
	@Column
	private StyleEnum style = StyleEnum.AV_1;

	@Enumerated(value = jakarta.persistence.EnumType.STRING)
	@Column
	private DetalizationEnum detalization = DetalizationEnum.HIGH;

	@Column(length = 1024)
	private String overridePrompt;

}
