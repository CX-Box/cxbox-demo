package org.demo.service.productEngine;


import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.demo.entity.MatrixItem;

@Getter
@Setter
public class ResultDto {
	private List<MatrixItem> matrixItems = new ArrayList<>();
	private String jpql;
	private String sql;
}
