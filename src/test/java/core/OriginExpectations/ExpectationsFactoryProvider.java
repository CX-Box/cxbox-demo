package core.OriginExpectations;

import lombok.Getter;
import lombok.Setter;


public class ExpectationsFactoryProvider {
    @Getter
    @Setter
    private static ExpectationPattern testFactory = new CxBoxExpectations();

}
