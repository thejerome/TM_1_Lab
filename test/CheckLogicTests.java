import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import rlcp.check.ConditionForChecking;
import rlcp.generate.GeneratingResult;
import rlcp.server.processor.check.CheckProcessor;
import rlcp.server.processor.check.PreCheckResultAwareCheckProcessor;
import rlcp.server.processor.factory.ProcessorFactory;
import vlab.server_java.model.util.HtmlParamEscaper;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static vlab.server_java.model.util.HtmlParamEscaper.prepareInputJsonString;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("classpath:test-*-server-config.xml")
@ActiveProfiles(profiles = "java")
//@ActiveProfiles(profiles = "js")
public class CheckLogicTests {
    private static final double DELTA = 1e-15;
    @Autowired
    private ProcessorFactory checkProcessor;

    @Test
    public void testCheckSingleCondition() throws Exception {
        PreCheckResultAwareCheckProcessor processor = (PreCheckResultAwareCheckProcessor) checkProcessor.getInstance();

        String code = "{&quot;radius_bounds&quot;:[3,3],&quot;mass&quot;:1}";
        String inst = "{&quot;i&quot;:null,&quot;v&quot;:0.1}";

        GeneratingResult generatingResult = mock(GeneratingResult.class);
        when(generatingResult.getText()).thenReturn("textPreGenerated");
        when(generatingResult.getCode()).thenReturn(code);
        when(generatingResult.getInstructions()).thenReturn(inst);



        ConditionForChecking conditionForChecking = mock(ConditionForChecking.class);
        when(conditionForChecking.getId()).thenReturn(1);
        when(conditionForChecking.getTime()).thenReturn(Long.parseLong("50"));
        when(conditionForChecking.getOutput()).thenReturn("getOutput");
        when(conditionForChecking.getInput()).thenReturn("getInput");

        String instructions = HtmlParamEscaper.escapeParam("{\"table\":[{\"r\":null,\"t1\":12,\"phi1\":12,\"t2\":12,\"phi2\":12,\"S\":12},{\"r\":12,\"t1\":12,\"phi1\":12,\"t2\":12,\"phi2\":12,\"S\":12}],\"i\":12,\"v\":12}");

        CheckProcessor.CheckingSingleConditionResult result = processor.checkSingleCondition(conditionForChecking, instructions, generatingResult);
        assertThat(result.getComment(), is(not(equalTo(""))));
        assertThat(result.getResult(), is(not(equalTo(""))));
    }
}
