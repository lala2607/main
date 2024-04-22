import React from "react";

import Calculator from "../../modulesCalculator/Calc/Сalculator";

import PolynomialCalculator from "../../modulesCalculator/Calc/PolynomialCalculator";

class Calc extends React.Component{
    operandCalcHandler(operand) {
        const calc = new Calculator();
        const a = calc.getValue(document.getElementById('a').value);
        const b = calc.getValue(document.getElementById('b').value);
        const result = calc[operand](a, b);
        document.getElementById('c').value = result !== null ? result.toString() : '';
    }

    operandPolyHandler() {
        const calc = new PolynomialCalculator();
        let text = document.getElementById('poly').value;
        const arr = text.split('\n');
        const a = calc.getValue(arr[0]);
        const b = calc.getValue(arr[2]);
        let operand;
        switch (arr[1]) {
            case '+': operand = 'add'; break;
            case '-': operand = 'sub'; break;
            case '*': operand = 'mult'; break;
            case 'scal': operand = 'prod'; break;
            case '^': operand = 'pow'; break;
        }
        const result = calc[operand](a, b);
        if (result) {
            text += `\n=\n${result.toString()}`;
            document.getElementById('poly').value = text;
        }
    }

    valuePolyHandler() {
        const calc = new PolynomialCalculator();
        const text = document.getElementById('poly').value;
        const a = calc.getValue(text.includes('=') ?
            text.split('=')[1] :
            text
        );
        const p = (new Calculator()).getValue(document.getElementById('point').value);
        const result = a.getValue(p);
        if (result) {
            document.getElementById('point').value = result.toString();
        }
    }

    addEventListeners() {
        document.getElementById('polyOperand')
            .addEventListener(
                'click',
                () => this.operandPolyHandler()
            );
        document.getElementById('polyValue')
            .addEventListener(
                'click',
                () => this.valuePolyHandler()
            );
    }
    render(){
        return(<>
            <div id = 'calc'>
            <h1>Универсальный калькулятор</h1>
            <textarea id="a" placeholder="a" cols="20" rows="5"></textarea>
            <textarea id="b" placeholder="b" cols="20" rows="5"></textarea>
            <textarea id="c" placeholder="result" cols="20" rows="5"></textarea>
            </div>
            <div>
                <button onClick={() => this.operandCalcHandler("add")} >+</button>
                <button onClick={() => this.operandCalcHandler("sub")} >-</button>
                <button onClick={() => this.operandCalcHandler("mult")} >*</button>
                <button onClick={() => this.operandCalcHandler("div")} >/</button>
                <button onClick={() => this.operandCalcHandler("prod")} >scal</button>
                <button onClick={() => this.operandCalcHandler("pow")} >^</button>
            </div>

            <div>
            <h1>Калькулятор полиномов</h1>
                <textarea id="poly" placeholder="poly1&#13;+&#13;poly2&#13;=&#13;result" cols="40" rows="5"></textarea>
                <textarea id="point" placeholder="Точка" cols="20" rows="5"></textarea>
                    <button id="polyOperand">Посчитать</button>
                    <button id="polyValue">Значение в точке</button>
            </div>
        </>)
    }

}

export default Calc; 