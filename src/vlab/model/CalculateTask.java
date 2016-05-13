package vlab.model;

/**
 * Created by efimchick on 19.04.16.
 */

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.Objects;

/**
 *
 Для calculate запроса - {
 "r": 3.5,
 "t": 3.6
 }


 */
public class CalculateTask {
    private final BigDecimal radius;
    private final BigDecimal time;

    @JsonCreator
    public CalculateTask(
            @JsonProperty("radius") BigDecimal radius,
            @JsonProperty("time") BigDecimal time) {
        Objects.requireNonNull(radius);
        Objects.requireNonNull(time);
        this.radius = radius;
        this.time = time;
    }

    public BigDecimal getRadius() {
        return radius;
    }

    public BigDecimal getTime() {
        return time;
    }
}
