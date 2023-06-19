package org.demo.controller;


import lombok.RequiredArgsConstructor;
import org.demo.entity.MatrixItem;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.service.productEngine.MatrixQueryParams;
import org.demo.service.productEngine.ProductEngine;
import org.demo.service.productEngine.ResultDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class ProductEngineController {

	@Autowired
	ProductEngine productEngine;
	@PostMapping("/byMatrixQueryParam")
	public ResponseEntity<ResultDto> matrixItemsByMatrixQueryParam(@RequestBody MatrixQueryParams matrixQueryParams) {
		return ResponseEntity.ok(productEngine.productEngineRun(matrixQueryParams));
	}

	@PostMapping("/matrixItemsByCalcId/{calcId}")
	public ResponseEntity<ResultDto> matrixItemsByCalcId(@PathVariable("calcId") Long calcId) {
		return ResponseEntity.ok(productEngine.productEngineRun(productEngine.calcProductMatrixItemQueryParams(calcId, MatrixTypeEnum.Product)));
	}

	@PostMapping("/matrixItemsQueryParamsByCalcId/{calcId}")
	public ResponseEntity<MatrixQueryParams> matrixItemsQueryParamsByCalcId(@PathVariable("calcId") Long calcId) {
		return ResponseEntity.ok(productEngine.calcProductMatrixItemQueryParams(calcId, MatrixTypeEnum.Product));
	}


}
